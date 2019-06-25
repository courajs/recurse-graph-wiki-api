export default [
{
  input: 'app.js',
  output: {
    file: 'public/app.js',
    format: 'iife',
  },
  // external: ['idb'],
},{
  input: 'sw.js',
  output: {
    file: 'public/sw.js',
    format: 'iife',
  },
}
];
