on testConnection()
  set previousFrontmostApp to (path to frontmost application) as text
  set testResult to {isRunning:false, isResponsive:false, errorMessage:""}

  try
    set testResult to isBearRunning(testResult)
    if not testResult's isRunning then return testResult

    set testResult to isBearResponsive(testResult)
    activate application previousFrontmostApp
    return testResult

  on error errMsg
    activate application previousFrontmostApp
    set testResult's errorMessage to errMsg
    return testResult
  end try
end testConnection


on isBearRunning(testResult)
  tell application "System Events"
    set runningApplications to name of every process
    if "Bear" is in runningApplications then
      set testResult's isRunning to true
    else
      set testResult's errorMessage to "Bear Notes is not running"
    end if
  end tell
  return testResult
end isBearRunning


on isBearResponsive(testResult)
  tell application "Bear"
    try
      activate
      delay 0.5
      set testResult's isResponsive to true

      tell application "System Events"
        tell process "Bear"
          if exists window 1 then
            set windowTitle to title of window 1
          end if
        end tell
      end tell

    on error bearError
      set testResult's isResponsive to false
      set testResult's errorMessage to "Bear Notes is not responsive: " & bearError
    end try
  end tell
  return testResult
end isBearResponsive