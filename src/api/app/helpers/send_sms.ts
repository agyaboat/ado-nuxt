import env from '#start/env'

interface SendSmsResponse {
  status: string
  data?: unknown
  message?: string
}

export async function sendSms(phoneNumber: string, message: string): Promise<SendSmsResponse> {
  const apiKey = env.get('ARKESEL_SMS_KEY')

  const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: 'Devapx',
      message,
      recipients: [phoneNumber],
    }),
  })

  const data = (await response.json()) as SendSmsResponse

  if (!response.ok) {
    console.log(data)
    throw new Error(data.message || `Arkesel SMS request failed with status ${response.status}`)
  }

  return data
}
