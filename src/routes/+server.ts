import * as cheerio from "cheerio";


export async function GET() {
  const response = await fetch("https://www.leskamas.com/en-gb/sell-kamas.html");
  const html = await response.text();
  const data = getTableData(html);
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const getTableData = (html: string) => {
  const $ = cheerio.load(html);
  const paypalValues: { serverName: string, paypalValue: string, status: string }[] = [];

  $('tr').each((index, element) => {
    const serverName = $(element).find('td').first().text().trim();
    if (serverName.startsWith('Dakal')) {
      const paypalValue = $(element).find('td').eq(1).text().trim();
      const status = $(element).find('td').eq(8).text().trim();
      paypalValues.push({ serverName, paypalValue, status });
    }
  });

  return paypalValues;
};
