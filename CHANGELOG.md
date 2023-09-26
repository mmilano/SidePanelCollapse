# Changelog


## [1.4.0] - 09-25-2023
no functional changes

* fix some remaining pathname casing errors
* minor code changes
* revise gulp tasks to use "exports" task definition, replacing older "gulp.task()" definitions
* package updates



## [1.3.2] - 07-19-2023
* revising camelCase of SidePanel naming for class and ID references (in HTML, in CSS, in JS),
along with all references
* replace older gulp-cssnano build process with newer postcss-based build process



## [1.3.1] - 07-15-2023
* fix a bug for when SidePanelCollapse() is called with just a string name by constructing a valid options{}
* minor simplifications



## [1.3.0] - 07-06-2023
* new dist builds for v1.3.0
* bootstrap to 4.6.2
* package updates
* minor javascript cleanup
* refine the demo site
* fix bug in sidebar layout of more advanced example page



## [1.2.0] - 01-07-2022
* package updates
* bootstrap to 4.6.1
* revision typing of multiple javascript variables
* convert some functions to arrow functions
* update year
* update readme content
* added/revised comments



## [1.1.1] - 06-04-2021
Primarily package updates

* bootstrap to 4.6.0
* package audit fix (w/o -force)



## [1.1.0] - 03-07-2020
Primarily package updates.


### Changed
* Updated browser targets
* Updated bootstrap usage to version 4.5.0.
* Updated jquery usage to version 3.5.1.
* Updated autoprefixer package
* Multiple other package updates



## [1.0.1] - 14-02-2020
### Added
* Change in SidePanelCollapse.js to reference the css variables. Prevents error when the sidepanel element is not in the page.

### Removed
* Removed popper.js from project inclusion - popup components are not used in the demo, so library isn't needed.

### Changed
* Revised message about independence of library from UX design of the SidePanel.
* Minor revisions to text content of demo pages.
* Updated the year (date) in footer.
* Updated jquery usage to version 3.4.1.
* Updated bootstrap usage to version 4.4.1.
* Updated multiple node packages.
* Rewrote the gulp webserver task to be slightly less brittle.




## [1.0.0] - 17-03-2019
### Added
* Initial release.
