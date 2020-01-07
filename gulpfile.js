const gulp = require("gulp");
const ftp = require("vinyl-ftp");
const log = require("fancy-log");
const del = require("del");
const open = require("open");
const packageJSON = require("./package.json");
const {
    host,
    user,
    pass,
    path: dest,
    secure = true,
    localSrc = "build"
} = require("./deploy-hosting-config.json");

let conn;

const createFtp = () => {
    if (conn) return;
    if (!host || !user || !pass || !dest) throw new Error("You must specify all host data in config file.");
    conn = ftp.create({
        host,
        user,
        pass,
        secure,
        log: log,
        secureOptions: {
            rejectUnauthorized: false
        }
    });
}

gulp.task("deploy:upload", () => {
    createFtp();
    return gulp.src(`${localSrc}/**/*`)
        .pipe(conn.newer(dest))
        .pipe(conn.dest(dest));
});

gulp.task("deploy:local-clean", () => {
    return del(localSrc);
})

gulp.task("deploy:server-clean", () => {
    createFtp();
    return conn.clean(`${dest}/**`, localSrc);
})

gulp.task("deploy", gulp.series("deploy:upload", "deploy:server-clean", "deploy:local-clean"));

gulp.task("start:browser", async () => {
    await open("https://m.vk.com/app" + (+packageJSON.vk_com_app_id));
})