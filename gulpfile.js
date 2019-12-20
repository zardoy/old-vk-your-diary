const gulp = require("gulp");
const ftp = require("vinyl-ftp");
const log = require("fancy-log");
const del = require("del");
const {
    host,
    user,
    pass,
    path: dest,
    secure = true,
    localSrc = "build"
} = require("./deploy-hosting-config.json");

if (!host || !user || !pass || !dest) throw new Error("You must specify all host data in config file.");

const conn = ftp.create({
    host,
    user,
    pass,
    secure,
    log: log,
    secureOptions: {
        rejectUnauthorized: false
    }
});

gulp.task("deploy:upload", () => {
    return gulp.src(`${localSrc}/**/*`)
        .pipe(conn.newer(dest))
        .pipe(conn.dest(dest));
});

gulp.task("deploy:local-clean", cb => {
    return del(localSrc);
})

gulp.task("deploy:server-clean", () => {
    return conn.clean(`${dest}/**`, localSrc);
})

gulp.task("deploy", gulp.series("deploy:upload", "deploy:server-clean", "deploy:local-clean"));