import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

async function main() {
  try {
    console.log("Connecting to:", connectionString.replace(/:[^:]*@/, ':****@')); // Hide password
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'UnknownSample';
      `);
      
      console.log("Columns in UnknownSample table:");
      console.table(res.rows);
      
      const hasLat = res.rows.some(r => r.column_name === 'lat');
      const hasLng = res.rows.some(r => r.column_name === 'lng');
      
      if (hasLat && hasLng) {
        console.log("SUCCESS: 'lat' and 'lng' columns exist.");
      } else {
        console.error("FAILURE: Missing columns!");
        if (!hasLat) console.error("- Missing 'lat'");
        if (!hasLng) console.error("- Missing 'lng'");
      }
      
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await pool.end();
  }
}

main();
