set previousFrontmostApp to (path to frontmost application) as text
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

		delay 2.0

		set frontmost to true
		delay 0.2

		key code 5 using {command down, shift down}
		delay 0.3

		keystroke "~/.bearsistence"
		keystroke return
		delay 0.3

		keystroke return
	end tell
end tell

delay 3
activate application previousFrontmostApp
