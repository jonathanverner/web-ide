# Planned Features #

## Editor ##

  - can show, work on files stored in

    1. Personal Storage (local server, ...)
    2. Google Drive, Dropbox, OwnCloud ...
    3. Git Repository

  - show multiple files in tabs

  - allows commenting on parts of the files
    (possibly on variables, functions & other language elements)

  - allows downloading the project as a zip/tgz

  - integrates version control operations:

    1. stage, commit, push, pull
    2. branch: create, switch, merge
    3. show history for a single file (as line annotations + show a particular version in the tab)

  - allows multiple people to edit a single file at once

  - has code-completion

## Shell ##

  - script access to files in current project
  - console can display graphics (plots, ...)
  - has a tab with variable display (allows modifying values)
  - can save & reload sessions (+ has a default session with autosave: work at one computer,
    go to another and continue work there)
  - code-completion
  - reloading scripts
  - debugging scripts:

    1. set breakpoints (on lines, functions)
    2. step into/out of/over   functions
    3. set watches
    4. profile script

# Architecture #

## General ##
  - workspace, fsview, editor, console, shell, shellview, filesystem, collaboration, vcs, diffselector, store (git-store, gstore, dropboxstore)
  - workspace: owns: console, shell, shellview, editor, fsview, filesystem, collaboration, vcs
  - filesystem: owns: store; interacts: shell, fsview
  - vsc: interacts: diffselector, git-store
  - editor: interacts: filesystem, collaboration
  - console: interacts: shell
  - shellview: interacts shell
  - fsview: interacts filesystem
  - collaboration: interacts editor
  
## Console ##
## Shell ##
## Store ##
## FileSystem ##

