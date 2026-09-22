package com.yhung.nursesstudy;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {

    private WebView webView;
    private View splashView;
    private Handler handler = new Handler();

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
        webView.getSettings().setLoadWithOverviewMode(true);
        webView.getSettings().setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());

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
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    }
