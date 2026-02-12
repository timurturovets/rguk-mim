const express = require('express');
const path = require('path');
const { google } = require('googleapis'); 

const app = express();

app.use(express.static(path.join(__dirname, 'frontend')));

app.use(express.json());

app.post('/api/submit', async (req, res) => {
  console.log('NODE VERSION', process.version);
  console.log('BODY:', req.body);

  try {
    const data = req.body;

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const now = new Date();
    const options = { timeZone: 'Europe/Moscow', hour12: false };

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: 'Заявки!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.fullName,
          data.usp,
          data.course,
          data.vk,
          data.source,
          data.talent,
          data.time,
          data.reason,
          now.toLocaleString('ru-RU', options),
        ]],
      },
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Пожалуйста, попробуйте перезагрузить сайт.');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
