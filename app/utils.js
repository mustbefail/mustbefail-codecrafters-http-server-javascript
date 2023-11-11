exports.getExecArgs = () => {
  const args = process.argv.slice(2)

  return args.reduce((acc, cur, i) => {
    if(i % 2 === 0) {
      acc[cur] = args[i + 1]
    }
    return acc
  }, {})
}
