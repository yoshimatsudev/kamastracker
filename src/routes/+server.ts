import * as cheerio from "cheerio";
import { ContractMissingDeployDataError } from "web3";


export async function GET() {
  const response = await fetch("https://www.leskamas.com/en-gb/sell-kamas.html", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "no-cache",
			"pragma": "no-cache",
			"priority": "u=0, i",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": "OCSESSID=3a85b2303c63a47633dc4594fe; language=en-gb; currency=EUR; twk_idm_key=mctfilWCJz-ob5mv447xy; TawkConnectionTime=0; twk_uuid_5ecb3c04c75cbf1769eefcc4=%7B%22uuid%22%3A%221.SwwGqRrY3A1PLFbcmt8vespc3XmwANCJESoXHMweDPVUZjV7sDKONBop5FKMy691OsePOLdk9socidEbhov0SkHu2IZFCktGVKpTBop1vrZNAVF2pP0U0%22%2C%22version%22%3A3%2C%22domain%22%3A%22leskamas.com%22%2C%22ts%22%3A1738764175211%7D"
		},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": null,
		"method": "GET"
	});
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
      const status = $(element).find('td').eq(7).text().trim();
      paypalValues.push({ serverName, paypalValue, status });
    }
  });

  return paypalValues;
};
