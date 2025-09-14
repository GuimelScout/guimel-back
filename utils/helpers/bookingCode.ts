export function getBookingCode(item: any) {
    const fecha = new Date(item.createdAt);
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaFormateada = `${day}${month}${anio}`;
    return `${item.id.toString().slice(-6).toUpperCase()}-${fechaFormateada}`;
}
