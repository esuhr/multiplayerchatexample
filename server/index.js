const express = require("express");
const path = require("path");
const morgan = require("morgan");
const PORT = process.env.PORT || 3000;
const socketio = require("socket.io");
const app = express();
const compression = require("compression");
const ejs = require("ejs");
module.exports = app;

async function startApp() {
    await createApp();
    await serverListener();
};

const serverListener = () => {
    const server = app.listen(PORT, ()=> {
        console.log(`Server listening on PORT: ${PORT}`);
    });
    const io = socketio(server);
    require("./socket")(io);
};

const createApp = () => {
    app.use(morgan("dev"));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(compression());

    app.use(express.static(path.join(__dirname, "..", "public")));
    app.set("views", path.join(__dirname, "..", "views"));
    app.set("view engine", "ejs");
    app.get("/", (req, res) => {
        res.render("index");
    });
    
    app.use((req, res, next) => {
        if(path.extname(req.path).length) {
            const err = new Error("Error 404: Path not found");
            err.status = 404;
            next(err);
        } else {
            next();
        };
    });

    app.use((err, req, res, next) => {
        console.error(err);
        console.error(err.stack);
        res.status(err.status || 500).send(err.message || "Error 500: Internal server error")
    })
};

startApp();