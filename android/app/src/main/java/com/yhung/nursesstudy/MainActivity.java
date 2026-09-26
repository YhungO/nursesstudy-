package com.yhung.nursesstudy;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {

    private static final int REQUEST_RECORD_AUDIO_PERMISSION = 1001;

    private WebView webView;
    private View splashView;
    private Handler handler = new Handler();
    private PermissionRequest pendingPermissionRequest;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(
                getResources().getColor(R.color.nurses_study_background)
        );

        getWindow().setNavigationBarColor(
                getResources().getColor(R.color.nurses_study_background)
        );

        FrameLayout root = new FrameLayout(this);

        // -----------------------------
        // WEBVIEW
        // -----------------------------
        webView = new WebView(this);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());

        // Configure WebChromeClient to handle WebRTC audio permissions securely
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        boolean audioRequested = false;
                        for (String resource : request.getResources()) {
                            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                                audioRequested = true;
                                break;
                            }
                        }

                        if (!audioRequested) {
                            request.deny();
                            return;
                        }

                        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                        } else {
                            pendingPermissionRequest = request;
                            requestPermissions(
                                    new String[]{Manifest.permission.RECORD_AUDIO},
                                    REQUEST_RECORD_AUDIO_PERMISSION
                            );
                        }
                    }
                });
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingPermissionRequest != null && pendingPermissionRequest.equals(request)) {
                    pendingPermissionRequest = null;
                }
            }
        });

        webView.loadUrl("https://nursesstudy.onrender.com/");

        root.addView(webView);

        // -----------------------------
        // SPLASH SCREEN
        // -----------------------------
        LinearLayout splash = new LinearLayout(this);
        splash.setOrientation(LinearLayout.VERTICAL);
        splash.setGravity(Gravity.CENTER);
        splash.setBackgroundColor(
                getResources().getColor(R.color.nurses_study_background)
        );

        ImageView logo = new ImageView(this);

        logo.setImageResource(R.drawable.nurses_study_logo_012456);
        logo.setScaleType(ImageView.ScaleType.CENTER_INSIDE);

        LinearLayout.LayoutParams logoParams =
                new LinearLayout.LayoutParams(
                        dp(180),
                        dp(180)
                );

        splash.addView(logo, logoParams);

        TextView title = new TextView(this);

        title.setText("Nurses Study");
        title.setTextColor(Color.WHITE);
        title.setTextSize(26);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(null, android.graphics.Typeface.BOLD);

        LinearLayout.LayoutParams titleParams =
                new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );

        titleParams.topMargin = dp(12);

        splash.addView(title, titleParams);

        ProgressBar progress = new ProgressBar(this);

        progress.setIndeterminate(true);
        progress.setIndeterminateTintList(
                android.content.res.ColorStateList.valueOf(
                        getResources().getColor(R.color.nurses_study_teal)
                )
        );

        LinearLayout.LayoutParams progressParams =
                new LinearLayout.LayoutParams(
                        dp(40),
                        dp(40)
                );

        progressParams.topMargin = dp(24);

        splash.addView(progress, progressParams);

        splashView = splash;

        root.addView(
                splashView,
                new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );

        setContentView(root);

        // Show the branded splash briefly.
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                splashView.setVisibility(View.GONE);
            }
        }, 1200);
    }

    private int dp(int value) {
        return (int) (
                value * getResources().getDisplayMetrics().density
        );
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            if (grantResults != null && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                }
            } else {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.deny();
                }
            }
            pendingPermissionRequest = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (pendingPermissionRequest != null) {
            try {
                pendingPermissionRequest.deny();
            } catch (Exception e) {}
            pendingPermissionRequest = null;
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
