
const fs = require('fs');
const path = require('path');

const directory = 'public/content/audio/sfx';

function parseWav(buffer, size) {
    if (buffer.toString('utf8', 0, 4) !== 'RIFF') return null;
    if (buffer.toString('utf8', 8, 12) !== 'WAVE') return null;

    // fmt chunk
    const fmtChunkSize = buffer.readUInt32LE(16);
    const audioFormat = buffer.readUInt16LE(20);
    const numChannels = buffer.readUInt16LE(22);
    const sampleRate = buffer.readUInt32LE(24);
    const byteRate = buffer.readUInt32LE(28);
    const blockAlign = buffer.readUInt16LE(32);
    const bitsPerSample = buffer.readUInt16LE(34);

    const duration = (size - 44) / byteRate;
    return duration;
}

function scan() {
    const files = fs.readdirSync(directory);
    const results = [];

    files.forEach(file => {
        if (file.startsWith('.')) return;
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(128);
        fs.readSync(fd, buffer, 0, 128, 0);
        fs.closeSync(fd);

        let duration = 0;
        let type = 'Unknown';

        if (file.endsWith('.wav')) {
            const d = parseWav(buffer, stats.size);
            if (d) {
                duration = d;
                type = 'WAV';
            }
        } else if (file.endsWith('.mp3')) {
            // Rough estimate: file size * 8 / 192kbps (average)
            // Or better, just mark as MP3
            duration = (stats.size * 8) / 128000; // Assume 128kbps
            type = 'MP3 (Est 128k)';
        }

        results.push({ name: file, duration: duration.toFixed(2), size: stats.size, type });
    });

    console.log(JSON.stringify(results, null, 2));
}

scan();
