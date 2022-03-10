var pool = require('./connection.js')

module.exports.getAllRooms = async function() {
  try {
    let sql = `Select roo_id,roo_name, crd_name as roo_topcard from room, card where roo_topcard_id = crd_id`;
    let result = await pool.query(sql);
    let rooms = result.rows;
    return { status: 200, result: rooms};
  } catch (err) {
    console.log(err);
    return { status: 500, result: err};
  }
}  

module.exports.getRoomById = async function (id) {
  try {
    let sql = `Select roo_id,roo_name, crd_name as roo_topcard from room, card where roo_topcard_id = crd_id and roo_id = $1`;
    let result = await pool.query(sql, [id]);
    if (result.rows.length > 0) {
      let room = result.rows[0];
      return { status: 200, result: room };
    } else {
      return { status: 404, result: { msg: "No room with that id" } };
    }
  } catch (err) {
    console.log(err);
    return { status: 500, result: err };
  }
}

module.exports.play = async function (id, value) {
  try {
    if (!parseInt(id)) {
      return { status: 400, result: { msg: "Room id must be a number" } };      
    }
    let sql = `select * from room, card, cardwcard
    where room.roo_id = $1 and
    room.roo_topcard_id = cardwcard.cwc_clooses_id and
    card.crd_id = cardwcard.cwc_cwins_id and
    card.crd_name ILIKE $2;`
    let result = await pool.query(sql, [id,value]);
    if (result.rows.length == 0) {
      let sqlr = `select * from room, card where room.roo_id = $1 
                  and room.roo_topcard_id = card.crd_id`;
      let resultr = await pool.query(sqlr, [id]);
      let room = resultr.rows[0];
      if (!room) {
        return { status: 404, result: { msg: "No room with that id" } };
      } else {
        return {
          status: 200,
          result: {
            victory: false,
            msg: "You Lost! That card does not beat the top card.",
            current_topcard: room.crd_name         
          }
        };
      }
    }
    let card_id =  result.rows[0].crd_id;
    let card_name = result.rows[0].crd_name;
    let sql2 = "UPDATE room SET roo_topcard_id = $1 WHERE roo_id = $2";
    let result2 = await pool.query(sql2, [  card_id, id  ]);
    if (result2.rowCount == 0) {
      return { status: 500, 
               result: { msg: "Not able to update. Many possible reasons (ex: room was deleted during play)" } };
    }
    return {
      status: 200,
      result: {
        victory: true,
        msg: "You Won!",
        current_topcard: card_name
      }
    };
  } catch (err) {
    console.log(err);
    return { status: 500, result: err };
  }
}    

module.exports.getRoomByNameOrTopCard = async function (parameters) {
  try {
    if (!parameters.name && !parameters.topcard) {
      return { status: 400, result: { msg: "No filters defined (name or topcard)" } };
    }
    let nparam = 1;
    let values = [];
    let sql = `Select roo_id,roo_name, crd_name as roo_topcard from room, card where roo_topcard_id = crd_id`;

    if (parameters.name) {
      sql += ` and roo_name ILIKE $${nparam}`;
      values.push("%"+parameters.name+"%");
      nparam++;
    }
    if (parameters.topcard) {
      if (parameters.name) sql+=" AND"
      sql += ` and crd_name ILIKE $${nparam}`;
      values.push(parameters.topcard);
      nparam++;
    }
    let result = await pool.query(sql, values);
    let rooms = result.rows;
    return { status: 200, result: rooms };
  } catch (err) {
    console.log(err);
    return { status: 500, result: err };
  }
}  
