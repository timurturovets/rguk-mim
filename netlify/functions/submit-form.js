import { google } from "googleapis";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: "1Nb7o7D5n9NQ8vbJoao2nCgfLVXCcvkNocbXdgY0qnmg",
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
