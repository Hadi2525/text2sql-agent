import pandas as pd
import sqlite3

# Function to convert CSV or Excel to SQLite
def convert_to_sqlite(input_file_path: str, sqlite_file_path: str, file_extension: str):
    try:
        # Read the file based on extension
        if file_extension == ".csv":
            df = pd.read_csv(input_file_path, encoding="utf-8")
        elif file_extension == ".xlsx":
            df = pd.read_excel(input_file_path, engine="openpyxl")
        else:
            raise ValueError("Unsupported file extension")

        if df.empty or df.columns.empty:
            raise ValueError("File is empty or missing headers")

        # Clean column names to avoid SQL issues
        columns = [str(col).replace('"', '').strip() for col in df.columns]
        table_name = "data_table"

        # Connect to SQLite
        conn = sqlite3.connect(sqlite_file_path)
        cursor = conn.cursor()

        # Create table with sanitized column names
        create_table_query = f"CREATE TABLE {table_name} ({', '.join([f'\"{col}\" TEXT' for col in columns])})"
        cursor.execute(create_table_query)

        # Insert data
        df.to_sql(table_name, conn, if_exists="append", index=False)

        conn.commit()
    except pd.errors.EmptyDataError:
        raise ValueError("File is empty or malformed")
    except pd.errors.ParserError as e:
        raise ValueError(f"File parsing error: {str(e)}")
    except sqlite3.Error as e:
        raise ValueError(f"SQLite error: {str(e)}")
    except Exception as e:
        raise ValueError(f"Unexpected error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
            
def get_schema(db_path: str):
    """
    Retrieve the schema of the SQLite database.
    Args:
        db_path (str): Path to the SQLite database file.
    Returns:
        dict: A dictionary containing the schema information.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    schema = []
    for table_name, create_statement in tables:
        schema.append(f"Table: {table_name}")
        schema.append(f"CREATE statement: {create_statement}\n")

        cursor.execute(f"SELECT * FROM '{table_name}' LIMIT 3;")
        rows = cursor.fetchall()
        if rows:
            schema.append("Example rows:")
            for row in rows:
                schema.append(str(row))
        schema.append("")  # Blank line between tables

    conn.close()
    return {"schema": "\n".join(schema)}

def execute_query(db_path: str, query: str):
    """
    Execute a SQL query on the SQLite database.
    Args:
        db_path (str): Path to the SQLite database file.
        query (str): SQL query to execute.
    Returns:
        dict: A dictionary containing the results and column names.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        results = [list(row) for row in rows]
        return {"results": results, "columns": columns}
    except sqlite3.Error as e:
        raise ValueError(f"SQLite error: {str(e)}")
    finally:
        conn.close()