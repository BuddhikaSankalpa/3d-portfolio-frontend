uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;
attribute float aSpeed;

varying float vScale;

void main()
{
    vec3 pos = position;

    float range = 60.0;
    pos.x = mod(pos.x + uTime * aSpeed + range * 0.5, range) - range * 0.5;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vScale = aScale;
}