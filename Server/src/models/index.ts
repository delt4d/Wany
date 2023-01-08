import { dbConfig } from "../config/db-config";
import mysql from "mysql2/promise"

const connectionString = `mysql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`

export const db = {
    query: async function (sql: string, values?: any) {
        const connection = await mysql.createConnection(connectionString)

        if (!(values instanceof Array)) {
            connection.config.namedPlaceholders = true
        }
        console.log(sql)
        connection.connect()
        const [rows, fields] = await (values != undefined ? connection.execute(sql, values) : connection.execute(sql))
        await connection.end()
        return { rows, fields }
    },
    callProcedure: async function (procedureName: string, values?: any, output?: string | string[]) {
        const connection = await mysql.createConnection(connectionString)
        connection.config.multipleStatements = true
        // connection.config.debug = true
        // connection.config.trace = true
        if (typeof output == "string") {
            output = [output]
            output = output.map(value => value[0] != "@" ? "@" + value : value)
        }

        function buildProcedureParameters() {
            let result = ""

            if (values instanceof Array) {
                result += values.map(() => "?").join(",")
            } else {
                connection.config.namedPlaceholders = true
                result += Object.keys(values).map(k => ":" + k).join(",")
            }

            if (output && output instanceof Array) {
                result += "," + output
            }
            return result
        }

        let sql = ""
        sql += "call " + procedureName + "(" + buildProcedureParameters() + ");"

        console.log(sql)
        connection.connect()

        if (output && output instanceof Array) {
            await connection.execute(sql, values)
            sql = "select " + output.join(",") + ";"
            const [rows, fields] = await connection.execute(sql)
            await connection.end()
            return { rows, fields }
        }

        const [rows, fields] = await connection.execute(sql, values)
        await connection.end()
        return { rows, fields }
    }
}