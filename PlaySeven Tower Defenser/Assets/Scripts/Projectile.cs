using UnityEngine;

public class Projectile : MonoBehaviour
{
    public float speed = 20f;

    private Enemy target;
    private int damage;

    public void SetTarget(Enemy enemy, int dmg)
    {
        target = enemy;
        damage = dmg;
    }

    void Update()
    {
        if (target == null)
        {
            Destroy(gameObject);
            return;
        }

        Vector3 direction = (target.transform.position - transform.position).normalized;
        transform.position += direction * speed * Time.deltaTime;
        transform.LookAt(target.transform);

        if (Vector3.Distance(transform.position, target.transform.position) < 0.5f)
        {
            target.TakeDamage(damage);
            Destroy(gameObject);
        }
    }
}
