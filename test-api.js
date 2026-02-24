async function test() {
  const rssRes = await fetch('https://feeds.bbci.co.uk/news/rss.xml');
  const rssText = await rssRes.text();
  const match = rssText.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/);
  console.log('BBC:', match ? match[1] : 'No match');
}
test();
