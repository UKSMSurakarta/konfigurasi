<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupHealthCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'health-check:setup {--token= : Generate and set health check token}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Setup and configure health check protection';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('');
        $this->info('═══════════════════════════════════════════════════');
        $this->info('      Health Check Security Setup');
        $this->info('═══════════════════════════════════════════════════');
        $this->info('');

        // Step 1: Generate token
        $this->line('<fg=yellow>Step 1: Generate secure health check token</>');
        $this->line('');

        $token = bin2hex(random_bytes(32));
        $this->line("<fg=green>✓ Generated token:</> <fg=blue>{$token}</>");
        $this->line('');

        // Step 2: Ask to update .env
        if ($this->confirm('Do you want to update .env with this token?', true)) {
            $this->updateEnvFile('HEALTH_CHECK_TOKEN', $token);
            $this->info('✓ Updated .env file');
        }

        $this->line('');

        // Step 3: IP Whitelist
        $this->line('<fg=yellow>Step 2: Configure IP Whitelist (optional)</>');
        $this->line('');

        $currentIps = env('HEALTH_CHECK_IPS', '(not set)');
        $this->line("Current IP whitelist: <fg=blue>{$currentIps}</>");
        $this->line('');

        if ($this->confirm('Do you want to configure IP whitelist?', false)) {
            $ips = $this->ask('Enter IPs to whitelist (comma-separated, e.g., 127.0.0.1,192.168.1.10)');
            
            if ($ips) {
                $this->updateEnvFile('HEALTH_CHECK_IPS', $ips);
                $this->info("✓ Updated IP whitelist: {$ips}");
            }
        }

        $this->line('');

        // Step 4: Enable/Disable
        $this->line('<fg=yellow>Step 3: Enable/Disable Health Check</>');
        $this->line('');

        $currentStatus = env('HEALTH_CHECK_ENABLED', 'true');
        $this->line("Current status: <fg=blue>{$currentStatus}</>");
        $this->line('');

        $enabled = $this->confirm('Enable health check?', true);
        $this->updateEnvFile('HEALTH_CHECK_ENABLED', $enabled ? 'true' : 'false');
        
        if ($enabled) {
            $this->info('✓ Health check enabled');
        } else {
            $this->warn('! Health check disabled');
        }

        $this->line('');

        // Step 5: Test
        if ($this->confirm('Do you want to test the health check endpoint?', false)) {
            $this->line('');
            $this->testHealthCheck($token);
        }

        // Summary
        $this->line('');
        $this->info('═══════════════════════════════════════════════════');
        $this->info('✓ Setup completed successfully!');
        $this->info('═══════════════════════════════════════════════════');
        $this->line('');
        $this->line('<fg=blue>Configuration Summary:</>');
        $this->line("  - Token: <fg=blue>{$token}</>");
        $this->line('  - Token added to: <fg=blue>.env (HEALTH_CHECK_TOKEN)</>');
        $this->line('');
        $this->line('<fg=yellow>Next steps:</>');
        $this->line('  1. Update your monitoring tools to use:');
        $this->line('     - URL: /health/up (simple) or /health (detailed)');
        $this->line("     - Header: X-Health-Check-Token: {$token}");
        $this->line('  2. Or configure IP whitelist in HEALTH_CHECK_IPS');
        $this->line('  3. Test the endpoint to verify it\'s working');
        $this->line('');
        $this->line('<fg=blue>Documentation: SECURITY_HEALTHCHECK_PROTECTION.md</>');
        $this->line('');
    }

    /**
     * Update or create environment variable in .env file
     */
    private function updateEnvFile(string $key, string $value): void
    {
        $path = base_path('.env');

        if (!file_exists($path)) {
            $this->error(".env file not found at {$path}");
            return;
        }

        $content = file_get_contents($path);
        
        // Escape special characters for regex
        $escapedValue = preg_quote($value, '/');
        
        // Check if key exists
        if (preg_match("/^{$key}=/m", $content)) {
            // Replace existing value
            $content = preg_replace(
                "/^{$key}=.*/m",
                "{$key}={$value}",
                $content
            );
        } else {
            // Append new line
            $content .= "\n{$key}={$value}";
        }

        file_put_contents($path, $content);
        
        // Clear config cache
        $this->call('config:clear');
    }

    /**
     * Test health check endpoints
     */
    private function testHealthCheck(string $token): void
    {
        $appUrl = config('app.url', 'http://localhost:8000');

        $this->line('<fg=blue>Testing endpoints:</>');
        $this->line('');
        $this->line('1. Testing with token header:');
        $this->line("   <fg=cyan>curl -H \"X-Health-Check-Token: {$token}\" {$appUrl}/health</>");
        $this->line('');
        $this->line('2. Testing simple health check:');
        $this->line("   <fg=cyan>curl -H \"X-Health-Check-Token: {$token}\" {$appUrl}/health/up</>");
        $this->line('');
        $this->line('3. Testing without authorization (should fail with 403):');
        $this->line("   <fg=cyan>curl {$appUrl}/health</>");
        $this->line('');
        $this->line('Run these commands to test the setup.');
    }
}
