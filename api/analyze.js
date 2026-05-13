export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    content: [{ text: '{"analyse":"test","questions":["q1"],"objections":[{"objection":"o1","reponse":"r1"}],"angle":"test","mail":"test"}' }] 
  });
}
