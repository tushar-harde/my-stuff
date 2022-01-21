import { ErrorResponse } from "@model/error.model";
import { Connection, Request, TYPES } from "tedious";

var config = {
    server: process.env.DB_SERVER,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        }
    },
    options: {
        database: process.env.DB_NAME
    }
};

class Database {
    private get connection() {
        return new Connection(config);
    }

    executeProc = (procName: string, data: Object, Type: any, callback: (error: ErrorResponse, result?: any) => any) => {
        this.connection.connect((err) => {
            if (err) {
                callback({
                    message: err.message,
                    isError: true
                });
            } else {
                try {
                    var result: any[] = [];
                    var resultCount: number;
    
                    // create request to database
                    var request = new Request(procName, (err, rowCount, rows) => {
                        if (err) {
                            callback({
                                message: err.message,
                                isError: true
                            });
                            request.removeAllListeners();
                        } else {
                            resultCount = +rowCount;
                        }
                        this.connection.close();
                    });
    
                    // add parameter to request
                    for (const [key, value] of Object.entries(data)) {
                        request.addParameter(key, TYPES.Char, value.toString().length > 0 ? value : null);
                    }
    
                    // fetch rows
                    request.on('row', async (columns) => {
                        try {
                            console.log(columns);
                            // var temp = {
                            //     key: function(n: string | number) {
                            //         return this[Object.keys(this)[n]];
                            //     }
                            // };
                            // columns.forEach((column) => {
                            //     temp[`${column.metadata.colName}`] = column.value;
                            // });
                            // if (+temp.ErrSeverity > 0) {
                            //     throw new Error(temp.ErrMsg);
                            // } else {
                            //     const typeObject = await new Type(temp);
                            //     result = result.concat(typeObject);   
                            // }                        
                        } catch (error) {
                            callback(error);
                            request.removeAllListeners();
                        }
                    });
    
                    // handle error
                    request.on("error", function (err) {
                        callback({
                            message: err.message,
                            isError: true
                        });
                        request.removeAllListeners();
                    });
    
                    // return result after request complete
                    request.on("requestCompleted", () => {                    
                        +resultCount > 1 ? callback({isError: false}, result) : callback({isError: false}, result[0]);
                        request.removeAllListeners();                
                    });
    
                    // call procedure
                    this.connection.callProcedure(request);
                } catch (error) {
                    callback(error);
                }
            }
        });
    }
}

export { Database }