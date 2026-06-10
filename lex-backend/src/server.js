import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n Lex backend running`);
  console.log(` Port     : ${PORT}`);
  console.log(` Mode     : ${process.env.NODE_ENV}`);
  console.log(` Health   : http://localhost:${PORT}/api/health\n`);
});

export default app;
