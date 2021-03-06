import { Parse, Output2String } from "../utils/parse";
import { Languages, handlerDefaultLanguage, isInDictionary } from '../utils/helper';
const got = require("got");

const covertedLanguages: Languages = {
  'zh-cn': 'chinese',
  'en': 'english',
  'jap': 'japanese',
  'fr': 'french',
}

function translate(text: string) {
  const second = covertedLanguages[handlerDefaultLanguage(text)];
  console.log(second);
  if(!second) return;
  return got
    .get(`https://www.linguee.com/english-${second}/search?source=auto&query=${text}`)
    .then((res: any) => {
      const parser = new Parse(res.body, "#dictionary");
      const normalTrans = parseNormalTrans(parser);
      parser.output.translates.push(...normalTrans);

      return Output2String(parser.output);
    })
    .catch(() => {
      return;
    });
}

export default async function linguee(pendingText: string) {
  if (!isInDictionary('Linguee')) return;
  let pre = `**[Linguee](https://www.linguee.com/english-chinese/search?source=auto&query=${escape(pendingText)})**\n\n`;
  let text = await translate(pendingText);
  if (text) return pre + text;
  return;
}

function parseNormalTrans(parser: Parse) {
  const { $, $container } = parser;
  const trans: Array<string> = [];
  $container.find(".exact .lemma.featured").each((index: number, item: any) => {
    const $li = $(item);
    const type = $li.find(".tag_wordtype").text();
    const result: Array<string> = [];
    $li.find(".translation a").each((index: number, item: any) => {
      const text = $(item).text();
      text && result.push(text);
    });
    const tran = result.join("; ");
    if (type) trans.push(`**${type}** &nbsp;&nbsp; ${tran}`);
    else if(tran) trans.push(tran);
  });
  return trans;
}
