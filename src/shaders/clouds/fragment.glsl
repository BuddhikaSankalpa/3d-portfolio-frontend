uniform float uOpacity;

varying float vScale;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main()
{
    vec2 uv = gl_PointCoord;
    float distanceToCenter = distance(uv, vec2(0.5));

    float strength = 1.0 - smoothstep(0.15, 0.5, distanceToCenter);

    float n = noise(uv * 5.0 + vScale * 10.0);
    strength *= 0.65 + 0.35 * n;

    strength = clamp(strength, 0.0, 1.0);

    gl_FragColor = vec4(1.0, 1.0, 1.0, strength * uOpacity);
}