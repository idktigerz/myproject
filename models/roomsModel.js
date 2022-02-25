var pool = require('./connection.js')
var beats = { rock: 'scissors', scissors: 'paper', paper: 'rock' };

module.exports.getAllRooms = async function() {
  try {
    let sql = "Select * from room";
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
    let sql = "Select * from room where roo_id = $1";
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
    if (!beats[value]) {
      return { status: 400, result: { msg: "Card value is not valid (rock,paper,scissors)" } };
    }
    let sql = "Select * from room where roo_id = $1";
    let result = await pool.query(sql, [id]);
    if (result.rows.length == 0) {
      return { status: 404, result: { msg: "No room with that id" } };
    }
    let room = result.rows[0];
    if (beats[value] != room.roo_topcard.toLowerCase()) {
      return {
        status: 200,
        result: {
          victory: false,
          msg: "You Lost! That card does not beat the top card.",
          current_topcard: room.roo_topcard
        }
      };
    }
    let sql2 = "UPDATE room SET roo_topcard = $1 WHERE roo_id = $2";
    let result2 = await pool.query(sql2, [value, id]);
    if (result2.rowCount == 0) {
      return { status: 500, 
                result: { msg: "Not able to update. Many possible reasons (ex: room was deleted during play)" } };
    }
    return {
      status: 200,
      result: {
        victory: true,
        msg: "You Won!",
        current_topcard: value
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
    let sql = "Select * from room where";

    if (parameters.name) {
      sql += ` roo_name LIKE $${nparam}`;
      values.push("%"+parameters.name+"%");
      nparam++;
    }
    if (parameters.topcard) {
      if (parameters.name) sql+=" AND"
      sql += ` roo_topcard LIKE $${nparam}`;
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
