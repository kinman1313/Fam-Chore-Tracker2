interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendResetEmail: (email: string, resetUrl: string) => Promise<void>;
export {};
