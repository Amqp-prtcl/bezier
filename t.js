console.log('test')


const test = (a, b) => {
    return {a, b, (a+b)}
}

var [t, y, n] = test(2, 7)

console.log(t)
console.log(y)
console.log(n)