import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  loadDatabase, 
  saveDatabase, 
  buildSheetCsvUrl, 
  extractSheetId, 
  parseCsv, 
  mapCsvToRecords, 
  normalizeDate,
  DEFAULT_STUDENTS,
  DatabaseState
} from './server/sheetSync.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory active database state
let dbState: DatabaseState = loadDatabase();

// Clean strings for tolerant comparison
function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\.\,\'\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// -------------------------------------------------------------
// PUBLIC STUDENT API (Search only - high privacy & security)
// -------------------------------------------------------------

// GET /api/classes - Returns available classes for dropdown
app.get('/api/classes', (_req: Request, res: Response) => {
  const set = new Set<string>();
  dbState.records.forEach(r => {
    if (r.kelas && r.kelas.trim()) {
      set.add(r.kelas.trim());
    }
  });
  const classes = Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  res.json({ classes, totalRecords: dbState.records.length, sheetName: dbState.config.sheetName });
});

// POST /api/search - Searches for student credential
app.post('/api/search', (req: Request, res: Response) => {
  const { nama, kelas, tanggalLahir } = req.body;

  if (!nama || !kelas || !tanggalLahir) {
    res.status(400).json({ found: false, message: 'Harap lengkapi nama, kelas, dan tanggal lahir.' });
    return;
  }

  const qNama = sanitize(nama);
  const qKelas = sanitize(kelas);
  const qTgl = normalizeDate(tanggalLahir);

  const matched = dbState.records.find(r => {
    const rNama = sanitize(r.nama);
    const rKelas = sanitize(r.kelas);
    const rTgl = normalizeDate(r.tanggalLahir);

    // Class must match
    if (rKelas !== qKelas) return false;

    // Date must match
    if (rTgl !== qTgl) return false;

    // Name match
    if (rNama === qNama) return true;

    // Token-based matching if multi-word
    const qTokens = qNama.split(' ').filter(Boolean);
    const rTokens = rNama.split(' ').filter(Boolean);
    const allQueryTokensInRecord = qTokens.every(token => 
      rTokens.some(rt => rt.includes(token) || token.includes(rt))
    );

    return allQueryTokensInRecord && qTokens.length >= 2;
  });

  if (matched) {
    res.json({
      found: true,
      data: matched
    });
  } else {
    res.json({
      found: false,
      message: 'Data akun tidak ditemukan dengan kombinasi nama, kelas, dan tanggal lahir tersebut.'
    });
  }
});

// GET /api/sample-students - Provides 3 samples for testing
app.get('/api/sample-students', (_req: Request, res: Response) => {
  const samples = dbState.records.slice(0, 3).map(r => ({
    id: r.id,
    nama: r.nama,
    kelas: r.kelas,
    tanggalLahir: r.tanggalLahir
  }));
  res.json({ samples });
});

// -------------------------------------------------------------
// BACKEND ADMIN API (Manage Google Sheet Database Access)
// -------------------------------------------------------------

// GET /api/admin/config - Returns current sheet status
app.get('/api/admin/config', (_req: Request, res: Response) => {
  res.json({
    config: dbState.config,
    totalRecords: dbState.records.length,
    sampleRecords: dbState.records.slice(0, 3)
  });
});

// POST /api/admin/sheet-config - Updates and syncs Google Sheet URL
app.post('/api/admin/sheet-config', async (req: Request, res: Response) => {
  const { sheetUrl } = req.body;

  if (!sheetUrl || typeof sheetUrl !== 'string' || !sheetUrl.trim()) {
    res.status(400).json({ success: false, error: 'URL Google Sheet tidak valid.' });
    return;
  }

  const trimmedUrl = sheetUrl.trim();
  const csvUrl = buildSheetCsvUrl(trimmedUrl);
  const sheetId = extractSheetId(trimmedUrl) || 'custom-sheet';

  try {
    const fetchRes = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*'
      }
    });

    if (!fetchRes.ok) {
      res.status(400).json({
        success: false,
        error: `Gagal mengakses Google Sheet (HTTP ${fetchRes.status}: ${fetchRes.statusText}). Pastikan link dapat diakses oleh "Siapa saja yang memiliki link" sebagai Pelihat.`
      });
      return;
    }

    const csvText = await fetchRes.text();
    if (!csvText || !csvText.trim()) {
      res.status(400).json({
        success: false,
        error: 'Spreadsheet kosong atau tidak mengembalikan isi data.'
      });
      return;
    }

    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      res.status(400).json({
        success: false,
        error: 'Spreadsheet harus memiliki minimal 1 baris judul kolom dan 1 baris data siswa.'
      });
      return;
    }

    const parsedRecords = mapCsvToRecords(rows);
    if (parsedRecords.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Kolom Nama, Kelas, atau Akun Belajar tidak terdeteksi pada spreadsheet ini. Harap periksa nama kolom di baris pertama.'
      });
      return;
    }

    // Update state and write to disk
    dbState = {
      config: {
        sheetUrl: trimmedUrl,
        sheetId,
        lastSyncedAt: new Date().toISOString(),
        totalRecords: parsedRecords.length,
        isCustom: true,
        sheetName: 'Google Sheets Sinkron'
      },
      records: parsedRecords
    };
    saveDatabase(dbState);

    res.json({
      success: true,
      message: `Berhasil menghubungkan dan membaca ${parsedRecords.length} data siswa dari Google Sheet!`,
      config: dbState.config,
      totalRecords: parsedRecords.length,
      preview: parsedRecords.slice(0, 3)
    });
  } catch (err: any) {
    console.error('Error fetching sheet in backend:', err);
    res.status(500).json({
      success: false,
      error: `Terjadi kendala saat menghubungkan ke Google Sheet: ${err.message || 'Koneksi gagal'}`
    });
  }
});

// POST /api/admin/reset - Resets database to default
app.post('/api/admin/reset', (_req: Request, res: Response) => {
  dbState = {
    config: {
      sheetUrl: '',
      sheetId: 'default',
      lastSyncedAt: null,
      totalRecords: DEFAULT_STUDENTS.length,
      isCustom: false,
      sheetName: 'Database Sekolah Bawaan'
    },
    records: DEFAULT_STUDENTS
  };
  saveDatabase(dbState);
  res.json({
    success: true,
    message: 'Database berhasil dikembalikan ke data simulasi bawaan.',
    config: dbState.config,
    totalRecords: dbState.records.length
  });
});

// -------------------------------------------------------------
// FRONTEND SERVING & DEV / PROD INTEGRATION
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Portal Akun Belajar berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
