import { readTXT, writeTXT, removeFile } from 'https://deno.land/x/flat@0.0.15/mod.ts';
import { parse, stringify } from "https://deno.land/x/xml/mod.ts";

const countries = ["Lebanon", "United Kingdom"];
const sources = ["elcinema.com", "mytelly.co.uk", "sat.tv", "sky.com"];

const channels_all_path = "docs/channels-all.m3u";
const channels_all = await readTXT(channels_all_path);
const lines = channels_all.split('#EXTINF');

const channels = [
  '#EXTM3U\n',
  ...lines.filter(l => countries.some(f => l.includes(`group-title="${f}"`)))
].join('#EXTINF');

const channels_path = `docs/channels.m3u`;
await writeTXT(channels_path, channels);
console.log("Wrote filtered m3u file");

const channel_ids = channels.match(/(?<=tvg-id=").*(?=" tvg-logo)/gm);
console.log("ids", channel_ids);

let channels_xml;

for (const source of sources) {
  const filename = `temp/${source}.channels.xml`;
  const txt = await readTXT(filename);
  const json = parse(txt);
  if (!channels) {
    channels_xml = json;
  } else {
    channels_xml.channels.channel = [...channels_xml.channels.channel, ...json.channels.channel];
  }
}
channels_xml.channels.channel = channels_xml.channels.channel.filter(c => channel_ids.includes(c['@xmltv_id']));
console.log("channels_xml", channels_xml);

const channels_xml_path = "docs/channels.xml";
await writeTXT(channels_xml_path, stringify(channels_xml));
console.log("Wrote filtered xml file");

for (const source of sources) {
  const filename = `temp/${source}.channels.xml`;
  await removeFile(filename);
  console.log(`Removed ${filename}`);
}