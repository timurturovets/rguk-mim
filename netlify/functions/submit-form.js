import { google } from "googleapis";

export const handler = async (event) => {
  console.log('NODE VERSION', process.version);
  console.log("RAW BODY:", event.body);
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('DATA:', data);
    
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: "1qAw5V_dl6Ls18jc7Q-MQ7Lv1oC8f_e2b5DLkMXWWMjE",
      range: "Заявки!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          data.fullName,
          data.usp,
          data.course,
          data.vk,
          data.source,
          data.talent,
          data.time,
          data.reason
        ]],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Пожалуйста, попробуйте перезагрузить сайт.",
    };
  }
};
