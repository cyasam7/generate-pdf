/* fs-extra, handlebars puppeteer */
const fs = require("fs-extra");
const hbs = require("handlebars");
const puppeter = require("puppeteer");
/* Path */
const path = require("path");

const data = require("./data.json");

const iniciar = async () => {
  try {
    const browser = await puppeter.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const content = await compilarPlantilla(data);
    await page.setContent(content);
    await page.emulateMediaFeatures("screen");
    const pdf = await page.pdf({
      path: `./reportes/reporte.pdf`,
      format: "letter",
      printBackground: true,
      scale: 0.6,
    });

    await browser.close();
    return pdf;
  } catch (error) {
    console.log(error);
  }
};

async function compilarPlantilla(data) {
  hbs.registerHelper("checklength", function (v1, v2, options) {
    "use strict";
    if (v1.length > v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  hbs.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
      case "==":
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case "===":
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case "!=":
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case "!==":
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case "<":
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case "<=":
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case ">":
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case ">=":
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case "&&":
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case "||":
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });
  const filePath = path.join(process.cwd(), "templates", "template.hbs");
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
}
iniciar().then((data) => {
  console.log(data);
});
