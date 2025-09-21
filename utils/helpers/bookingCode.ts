export function getBookingCode(item: any) {
    const fecha = new Date(item.createdAt);
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear() % 100;
    const fechaFormateada = `${day}${month}${anio}`;
    

    const idCode = item.id 
      ? item.id.toString().slice(-6).toUpperCase()
      : Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${idCode}-${fechaFormateada}`;
}
