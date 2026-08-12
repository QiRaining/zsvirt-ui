export function formatPowerStatus(powerStatus: string) {
  if (powerStatus === 'Chassis Power is on') {
    return 'PowerOn'
  }

  if (powerStatus === 'Chassis Power is off') {
    return 'PowerOff'
  }

  return 'Unknown'
}
