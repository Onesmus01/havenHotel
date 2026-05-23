

const displayKESCurrency = (number) => {
    const formatter = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
    });
    return formatter.format(number);
}

export default displayKESCurrency