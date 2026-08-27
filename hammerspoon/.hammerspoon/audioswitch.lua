local DEVICE_A = "Mac mini Speakers"
local DEVICE_B = "External Headphones"

local function setOutput(name)
	for _, dev in ipairs(hs.audiodevice.allOutputDevices()) do
		if dev:name() == name then
			dev:setDefaultOutputDevice()
			return true
		end
	end
	return false
end

hs.hotkey.bind({ "cmd", "alt" }, "s", function()
	local current = hs.audiodevice.defaultOutputDevice():name()
	local target = (current == DEVICE_A) and DEVICE_B or DEVICE_A
	if setOutput(target) then
		hs.alert.show("Audio -> " .. target)
	else
		hs.alert.show("Device not found: " .. target)
	end
end)
