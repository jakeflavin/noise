import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Gauge } from './Gauge'
import { zones, type Thresholds } from '@/lib/presets'

const thresholds: Thresholds = { calm: 20, working: 40, loud: 60 }
const props = {
  thresholds,
  zone: zones.calm,
  listening: true,
  alerting: false,
  zoneInk: zones.calm.ink.light,
}

describe('Gauge', () => {
  it('names the zone and the reading, since the dial itself is a picture', () => {
    render(<Gauge {...props} level={37} zone={zones.working} />)
    expect(screen.getByRole('img')).toHaveAccessibleName('Working. Noise level 37 out of 100.')
  })

  it('says the microphone is off rather than calling a stopped meter calm', () => {
    render(<Gauge {...props} level={0} listening={false} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Paused')
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toContain('Calm')
  })

  it('rounds the announced level rather than reading out a fraction', () => {
    render(<Gauge {...props} level={36.7} />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('37 out of 100')
  })

  it('flags the alert on the element, so the stylesheet owns what that looks like', () => {
    render(<Gauge {...props} level={90} alerting />)
    expect(screen.getByRole('img')).toHaveAttribute('data-alerting')
  })

  it('leaves the attribute off entirely when nothing is wrong', () => {
    render(<Gauge {...props} level={10} />)
    expect(screen.getByRole('img')).not.toHaveAttribute('data-alerting')
  })

  it('draws one band per zone the activity actually uses', () => {
    const { container } = render(<Gauge {...props} level={10} />)
    expect(container.querySelectorAll('path[stroke-opacity="0.22"]')).toHaveLength(4)
  })

  it('leaves out a band with nothing in it rather than drawing it backwards', () => {
    // calm and working share a line, so the working band has zero width.
    const squeezed: Thresholds = { calm: 40, working: 40, loud: 60 }
    const { container } = render(<Gauge {...props} thresholds={squeezed} level={10} />)
    expect(container.querySelectorAll('path[stroke-opacity="0.22"]')).toHaveLength(3)
  })
})
