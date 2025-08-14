tell application "Bear" to activate
delay 0.5

tell application "System Events"
		tell process "Bear"
				repeat until frontmost is true
						delay 0.5
				end repeat

		if not (exists window 1) then
				keystroke "n" using command down
				delay 0.6

				keystroke return using command down
				delay 0.3

				keystroke (ASCII character 8) using command down
				delay 0.5
		end if

		repeat until exists menu item "Backup Notes..." of menu "File" of menu bar 1
				delay 0.2
		end repeat

		click menu item "Backup Notes..." of menu "File" of menu bar 1

		repeat until exists window 1 whose subrole is "AXDialog"
				delay 0.2
		end repeat

		set exportWindow to window 1

		repeat until exists button "Export notes" of exportWindow
				delay 0.2
		end repeat

		keystroke "g" using {command down, shift down}
		delay 0.3
		keystroke "~/.bearsistence"
		keystroke return
		delay 0.3

		click button "Export notes" of exportWindow
		end tell
end tell

delay 3
