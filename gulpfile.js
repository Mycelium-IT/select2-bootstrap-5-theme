// Core dependencies
import gulp from "gulp";

// External dependencies
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { deleteAsync as del } from "del";
import gulpif from "gulp-if";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import rtlcss from "rtlcss";
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass';
import stylelint from "stylelint";
import gulpStylelint from "gulp-stylelint";

const sass = gulpSass(dartSass);

const config = {
    stylelint: {
        failAfterError: true,
        quietDeprecationWarnings: true,
        reporters: [
            {
                formatter: 'verbose',
                console: true,
            },
        ],
    },
    sass: {
        outputStyle: "expanded",
    },
    autoprefixer: {
        cascade: true,
    },
    cssnano: {
        preset: [
            "default",
            {
                cssDeclarationSorter: false,
                svgo: false,
            }
        ],
    },
}

/* Start docs tasks */
gulp.task( "docs:clean", () => {
    return del( [
        "docs/assets/css"
    ] )
} )

// gulp.task( "docs:lint", () => {
//     return gulp.src( "docs/_sass/**/*.scss" )
//         .pipe( gulpStylelint( config.stylelint ) )
// } )

gulp.task( "docs:compile:main", () => {
    return gulp.src( "docs/_sass/docs.scss" )
        .pipe( sass.sync( config.sass ).on( "error", sass.logError ) )
        .pipe( postcss( [
            autoprefixer( config.autoprefixer ),
            cssnano( config.cssnano )
        ] ) )
        .pipe( gulp.dest( "docs/assets/css" ) )
} )

gulp.task( "docs:compile:rtl", () => {
    return gulp.src( "docs/_sass/rtl.scss" )
        .pipe( sass.sync( config.sass ).on( "error", sass.logError ) )
        .pipe( postcss( [
            autoprefixer( config.autoprefixer ),
            rtlcss(),
            cssnano( config.cssnano )
        ] ) )
        .pipe( gulp.dest( "docs/assets/css" ) )
} )

gulp.task( "docs:compile:testing", () => {
    return gulp.src( "docs/_sass/testing.scss" )
        .pipe( sass.sync( config.sass ).on( "error", sass.logError ) )
        .pipe( postcss( [
            autoprefixer( config.autoprefixer )
        ] ) )
        .pipe( gulp.dest( "docs/assets/css" ) )
        .pipe( postcss( [
            rtlcss()
        ] ) )
        .pipe( rename( {
            suffix: ".rtl"
        } ) )
        .pipe( gulp.dest( "docs/assets/css" ) )
} )

gulp.task( "docs:watch", ( done ) => {
    gulp.watch( "docs/_sass/**/*.scss", gulp.series( "docs:compile" ) )

    done()
} )

gulp.task( "docs:compile", gulp.series( "docs:clean", "docs:compile:main", "docs:compile:rtl", "docs:compile:testing" ) )
// gulp.task( "docs:compile", gulp.series( "docs:clean", "docs:lint", "docs:compile:main", "docs:compile:rtl", "docs:compile:testing" ) )
/* End docs tasks */

gulp.task( "clean", () => {
    return del( [
        "dist"
    ] )
} )

// gulp.task( "lint", () => {
//     return gulp.src( "src/**/*.scss" )
//         .pipe( gulpStylelint( config.stylelint ) )
// } )

const compile = ( rtl = false ) => {
    let postcss_options = [
        autoprefixer( config.autoprefixer )
    ]

    if ( rtl ) {
        postcss_options.push( rtlcss() )
    }

    return gulp.src( "src/select2-bootstrap-5-theme.scss" )
        .pipe( sass.sync( config.sass ).on( "error", sass.logError ) )
        .pipe( postcss( postcss_options ) )
        .pipe( gulpif( rtl, rename( {
            suffix: ".rtl"
        } ) ) )
        .pipe( gulp.dest( "dist" ) )
        .pipe( postcss( [
            cssnano( config.cssnano )
        ] ) )
        .pipe( rename( {
            suffix: ".min"
        } ) )
        .pipe( gulp.dest( "dist" ) )
}

gulp.task( "compile:main", () => {
    return compile( false )
} )

gulp.task( "compile:rtl", () => {
    return compile( true )
} )

gulp.task( "compile", gulp.series( "clean", "compile:main", "compile:rtl", "docs:compile" ) )
// gulp.task( "compile", gulp.series( "clean", "lint", "compile:main", "compile:rtl", "docs:compile" ) )

gulp.task( "watch", ( done ) => {
    gulp.watch( "src/*.scss", gulp.series( "compile" ) )
    done()
} )

gulp.task( "default", gulp.series( "compile", "watch" ) )

gulp.task( "docs", gulp.series( "docs:compile", "docs:watch" ) )