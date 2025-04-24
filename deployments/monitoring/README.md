      ┌──────────────┐
      │  API App  │ ◄───── Instrumented (OpenTelemetry SDK)
      └──────┬───────┘
             │
             ▼
      ┌────────────────────────┐
      │  OpenTelemetry Collector│ ◄──── Receives OTLP from apps (traces + metrics)
      └────┬────────┬──────────┘
           │        │
           ▼        ▼
    ┌────────┐   ┌───────────┐
    │ Tempo  │   │ Prometheus│ ◄──── Metrics (via scraping)
    └────────┘   └───────────┘
                       ▲
                 ┌─────┴───────┐
                 │ Node Export │
                 │ cAdvisor    │
                 │ Postgres Exp│
                 └─────────────┘

┌──────────────┐
│ Promtail │ ◄──── Reads logs from stdout
└────┬─────────┘
▼
┌────────┐
│ Loki │ ◄───────── Stores logs
└────────┘

       ▼

┌───────────────────┐
│ Grafana │ ◄── Dashboards for:
│ - Metrics (Prom) │
│ - Traces (Tempo) │
│ - Logs (Loki) │
└───────────────────┘
