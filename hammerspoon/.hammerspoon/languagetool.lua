-- CONFIGURATION
-- Helper function to load API key from .env file
local function loadEnvFile()
	local envFile = "/Users/liuguangxi/envfiles/.env"
	local file = io.open(envFile, "r")
	if file then
		for line in file:lines() do
			local value = line:match("^GLM_API_KEY=(.+)$")
			if value then
				value = value:match("^%s*(.-)%s*$")
				value = value:gsub("^['\"]", ""):gsub("['\"]$", "")
				return value
			end
		end
		file:close()
	end
	return nil
end

-- API Key loaded from .env file or environment variable
local apiKey = loadEnvFile() or os.getenv("GLM_API_KEY")

if not apiKey then
	hs.alert.show("GLM API Key not found! Please set GLM_API_KEY in .env file")
end

-- ZhipuAI's OpenAI-Compatible Endpoint
local modelEndpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

-- The Prompt
local systemPrompt =
	"You are a helpful assistant. Rewrite the following text to be concise, natural, and professional English. Do not explain, just output the rewrite."

local function refineText()
	local currentElement = hs.uielement.focusedElement()
	local selectedText = nil

	if currentElement then
		selectedText = currentElement:selectedText()
	end

	if not selectedText or selectedText == "" then
		hs.eventtap.keyStroke({ "cmd" }, "c")
		hs.timer.usleep(50000)
		selectedText = hs.pasteboard.getContents()
	end

	if not selectedText then
		hs.alert.show("No text selected!")
		return
	end

	hs.alert.show("Refining with GLM-4.7...")

	-- GLM/OpenAI Compatible JSON Body
	local body = hs.json.encode({
		model = "GLM-4.7-Flash",
		messages = {
			{ role = "system", content = systemPrompt },
			{ role = "user", content = selectedText },
		},
		temperature = 0.7,
	})

	local headers = {
		["Content-Type"] = "application/json",
		["Authorization"] = "Bearer " .. apiKey,
	}

	hs.http.asyncPost(modelEndpoint, body, headers, function(code, body, headers)
		if code == 200 then
			local response = hs.json.decode(body)
			-- GLM returns standard OpenAI format now
			local refinedText = response.choices[1].message.content

			refinedText = refinedText:gsub("^%s*(.-)%s*$", "%1") -- trim whitespace

			hs.pasteboard.setContents(refinedText)
			hs.eventtap.keyStroke({ "cmd" }, "v")
		else
			-- Error Handling for Zhipu
			print("Zhipu Error: " .. body)
			hs.alert.show("API Error: " .. code)
		end
	end)
end

-- Bind to Option + R
hs.hotkey.bind({ "alt" }, "r", refineText)

