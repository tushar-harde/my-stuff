import 'reflect-metadata';
import { container } from "tsyringe";
import { Database } from "./db";
import { User } from "./user";

// var test = {
//     name: "Zimbaroo's Geeks",
//     password: 123456
// }

// class App {
//     constructor(private db: Database) {}

//     execute() {
//         this.db.executeProc("test", {}, User, (error, user) => {
//             if (!error.isError) {
//                 console.log(user);
//             } else {
//                 console.log(error);
//             }
//         });
//     }
// }

const db = container.resolve(Database);

db.executeProc("test", {}, User, (error, user) => {
    if (!error.isError) {
        console.log(user);
    } else {
        console.log(error);
    }
});

// const type = User.apply(this, [0, 1, 2, 3, 4]);