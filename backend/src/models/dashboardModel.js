const pool=require('../config/database');

const dashboardAdmin=async(idTienda)=>{
    // Ventas últimos 7 días agrupadas por día
    const ventas7dias = await pool.query(
        `SELECT DATE(v.fecha) AS dia,
                COUNT(*) AS num_ventas,
                COALESCE(SUM(v.total),0) AS total_ventas
         FROM ventas v
         WHERE v.id_tienda=$1 AND v.fecha >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY DATE(v.fecha)
         ORDER BY dia`,
        [idTienda]
    );

    // KPIs
    const kpis = await pool.query(
        `SELECT 
            (SELECT COALESCE(SUM(total),0) FROM ventas WHERE id_tienda=$1 AND fecha::date=CURRENT_DATE) AS ventas_hoy,
            (SELECT COUNT(*) FROM ventas WHERE id_tienda=$1 AND fecha::date=CURRENT_DATE) AS boletas_hoy,
            (SELECT COALESCE(SUM(total),0) FROM ventas WHERE id_tienda=$1 AND fecha >= CURRENT_DATE - INTERVAL '6 days') AS ventas_semana,
            (SELECT COUNT(*) FROM ventas WHERE id_tienda=$1 AND fecha >= CURRENT_DATE - INTERVAL '6 days') AS boletas_semana,
            (SELECT COUNT(*) FROM productos p JOIN inventario i ON p.id_producto=i.id_producto WHERE p.id_tienda=$1 AND p.estado=TRUE AND i.stock_actual < i.stock_minimo) AS alertas_activas`,
        [idTienda]
    );

    // Top productos más vendidos (últimos 7 días)
    const topProductos = await pool.query(
        `SELECT p.nombre, SUM(dv.cantidad) AS total_qty, SUM(dv.subtotal) AS total_revenue
         FROM detalle_ventas dv
         JOIN ventas v ON dv.id_venta=v.id_venta
         JOIN productos p ON dv.id_producto=p.id_producto
         WHERE v.id_tienda=$1 AND v.fecha >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY p.id_producto, p.nombre
         ORDER BY total_qty DESC
         LIMIT 6`,
        [idTienda]
    );

    // Alertas de stock
    const alertas = await pool.query(
        `SELECT p.id_producto, p.nombre, p.codigo,
                a.codigo AS anaquel_codigo,
                i.stock_actual, i.stock_minimo,
                CASE 
                    WHEN i.stock_actual <= 0 THEN 'empty'
                    WHEN i.stock_actual < i.stock_minimo * 0.4 THEN 'critical'
                    ELSE 'low'
                END AS estado_stock
         FROM productos p
         JOIN inventario i ON p.id_producto=i.id_producto
         LEFT JOIN anaqueles a ON p.id_anaquel=a.id_anaquel
         WHERE p.id_tienda=$1 AND p.estado=TRUE AND i.stock_actual < i.stock_minimo
         ORDER BY i.stock_actual ASC
         LIMIT 8`,
        [idTienda]
    );

    return {
        ventas_7_dias: ventas7dias.rows,
        kpis: kpis.rows[0],
        top_productos: topProductos.rows,
        alertas: alertas.rows
    };
};

const dashboardTrabajador=async(idTienda, idTrabajador)=>{
    // KPIs del trabajador
    const kpis = await pool.query(
        `SELECT 
            (SELECT COALESCE(SUM(total),0) FROM ventas WHERE id_tienda=$1 AND id_trabajador=$2 AND fecha::date=CURRENT_DATE) AS mis_ventas_hoy,
            (SELECT COUNT(*) FROM ventas WHERE id_tienda=$1 AND id_trabajador=$2 AND fecha::date=CURRENT_DATE) AS mis_boletas_hoy,
            (SELECT COALESCE(SUM(total),0) FROM ventas WHERE id_tienda=$1 AND fecha::date=CURRENT_DATE) AS ventas_tienda_hoy,
            (SELECT COUNT(*) FROM ventas WHERE id_tienda=$1 AND fecha::date=CURRENT_DATE) AS boletas_tienda_hoy`,
        [idTienda, idTrabajador]
    );

    // Items vendidos hoy por el trabajador
    const itemsHoy = await pool.query(
        `SELECT COALESCE(SUM(dv.cantidad),0) AS total_items
         FROM detalle_ventas dv
         JOIN ventas v ON dv.id_venta=v.id_venta
         WHERE v.id_tienda=$1 AND v.id_trabajador=$2 AND v.fecha::date=CURRENT_DATE`,
        [idTienda, idTrabajador]
    );

    // Ventas por hora del día
    const ventasPorHora = await pool.query(
        `SELECT EXTRACT(HOUR FROM v.fecha)::int AS hora,
                COALESCE(SUM(v.total),0) AS total
         FROM ventas v
         WHERE v.id_tienda=$1 AND v.fecha::date=CURRENT_DATE
         GROUP BY hora
         ORDER BY hora`,
        [idTienda]
    );

    // Últimas ventas del trabajador
    const ultimasVentas = await pool.query(
        `SELECT v.id_venta, v.fecha, v.total,
                (SELECT COUNT(*) FROM detalle_ventas dv WHERE dv.id_venta=v.id_venta) AS num_items
         FROM ventas v
         WHERE v.id_tienda=$1 AND v.id_trabajador=$2
         ORDER BY v.fecha DESC
         LIMIT 6`,
        [idTienda, idTrabajador]
    );

    return {
        kpis: {...kpis.rows[0], items_vendidos_hoy: itemsHoy.rows[0].total_items},
        ventas_por_hora: ventasPorHora.rows,
        ultimas_ventas: ultimasVentas.rows
    };
};

const reporteInventario=async(idTienda)=>{
    // Inventario por categoría
    const porCategoria = await pool.query(
        `SELECT c.nombre AS categoria,
                COUNT(p.id_producto) AS num_productos,
                COALESCE(SUM(i.stock_actual),0) AS total_unidades,
                COALESCE(SUM(i.stock_actual * p.precio),0) AS valor_total
         FROM categorias c
         LEFT JOIN productos p ON c.id_categoria=p.id_categoria AND p.estado=TRUE
         LEFT JOIN inventario i ON p.id_producto=i.id_producto
         WHERE c.id_tienda=$1 AND c.estado=TRUE
         GROUP BY c.id_categoria, c.nombre
         ORDER BY c.nombre`,
        [idTienda]
    );

    // Resumen ejecutivo
    const resumen = await pool.query(
        `SELECT 
            COUNT(p.id_producto) AS total_skus,
            COALESCE(SUM(i.stock_actual),0) AS total_unidades,
            COUNT(p.id_producto) FILTER (WHERE i.stock_actual < i.stock_minimo) AS con_alerta,
            COALESCE(SUM(i.stock_actual * p.precio),0) AS valor_total
         FROM productos p
         JOIN inventario i ON p.id_producto=i.id_producto
         WHERE p.id_tienda=$1 AND p.estado=TRUE`,
        [idTienda]
    );

    return {
        por_categoria: porCategoria.rows,
        resumen: resumen.rows[0]
    };
};

const reporteVentas = async (idTienda, inicio, fin) => {
    const ventasPorDia = await pool.query(
        `SELECT DATE(fecha) AS fecha,
                COUNT(*) AS cantidad_boletas,
                COALESCE(SUM(total), 0) AS total_dia
         FROM ventas
         WHERE id_tienda=$1 AND DATE(fecha) >= $2 AND DATE(fecha) <= $3
         GROUP BY DATE(fecha)
         ORDER BY fecha DESC`,
        [idTienda, inicio, fin]
    );

    const resumen = await pool.query(
        `SELECT COUNT(*) AS total_boletas,
                COALESCE(SUM(total), 0) AS total_ingresos
         FROM ventas
         WHERE id_tienda=$1 AND DATE(fecha) >= $2 AND DATE(fecha) <= $3`,
        [idTienda, inicio, fin]
    );

    return {
        resumen: resumen.rows[0],
        ventas_por_dia: ventasPorDia.rows
    };
};

module.exports={dashboardAdmin, dashboardTrabajador, reporteInventario, reporteVentas};
