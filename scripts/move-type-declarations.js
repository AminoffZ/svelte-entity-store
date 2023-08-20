import sander from 'sander'
import { sync as globSync } from 'glob'

// Using synchronous globbing
globSync('src/**/*.js').forEach((file) => {
    sander.unlinkSync(file)
})

sander.rimrafSync('types')

globSync('src/**/*.d.ts').forEach((file) => {
    const newLocation = file.replace(/^src/, 'types')
    sander.renameSync(file).to(newLocation)
})
