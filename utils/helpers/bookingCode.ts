export function getBookingCode(item: any) {
  
    const fecha = new Date(item.createdAt);
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear() % 100;
    const dateFormat = `${day}${month}${anio}`;
    
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const idCode = item.id 
      ? `${item.id.toString().slice(-4)}${timestamp}`.toUpperCase()
      : `${random}${timestamp}`.toUpperCase();
    
    return `${idCode}-${dateFormat}`;
}
