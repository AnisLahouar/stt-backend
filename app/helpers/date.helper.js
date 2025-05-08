exports.toMySQLDate = (input) => {
	const date = new Date(input);

	if (isNaN(date.getTime())) throw new Error('Invalid date input');

	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}-${mm}-${dd}`;
}

exports.formatMySQLDate = (mysqlDate, format) => {
	const [yyyy, mm, dd] = mysqlDate.split('-');

	return format
		.replace(/YYYY/g, yyyy)
		.replace(/MM/g, mm)
		.replace(/DD/g, dd);
}