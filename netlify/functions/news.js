exports.handler = async function(event, context) {
  const apiKey = process.env.REACT_APP_NEWSDATA_API_KEY;
  const res = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=NBA OR NFL OR MLB OR NHL OR UFC&language=en&category=sports`);
  const data = await res.json();
  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data),
  };
};