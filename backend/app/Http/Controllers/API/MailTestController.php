<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\MailService;
use Illuminate\Http\Request;

class MailTestController extends Controller
{
    public function __construct(
        protected MailService $mailService
    ) {}

    /**
     * Test sending a welcome email.
     */
    public function sendTestEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $recipient = $request->email;
        $subject = "Welcome to UKSM!";
        $htmlBody = "
            <h2>Halo, Selamat Datang!</h2>
            <p>Terima kasih telah bergabung dengan sistem <strong>UKSM (Unit Kesehatan Sekolah Modern)</strong>.</p>
            <p>Akun Anda telah berhasil diaktivasi. Silakan klik tombol di bawah ini untuk masuk ke dashboard:</p>
            <p style='text-align: center;'>
                <a href='" . config('app.url') . "' class='btn'>Buka Dashboard</a>
            </p>
            <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>
        ";

        $success = $this->mailService->send($recipient, $subject, $htmlBody);

        if ($success) {
            return response()->json([
                'status' => 'success',
                'message' => 'Email sent successfully. Please check your inbox (or Mailtrap).'
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Failed to send email. Check logs for details.'
        ], 500);
    }
}
